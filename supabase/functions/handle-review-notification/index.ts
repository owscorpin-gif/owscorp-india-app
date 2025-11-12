import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviewId } = await req.json();

    if (!reviewId) {
      throw new Error('Review ID is required');
    }

    // Create Supabase client with service role key to access all data
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch review details with service and customer information
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select(`
        *,
        services (title, developer_id),
        profiles!customer_id (display_name)
      `)
      .eq('id', reviewId)
      .single();

    if (reviewError) {
      console.error('Error fetching review:', reviewError);
      throw new Error('Failed to fetch review details');
    }

    console.log('Processing review:', {
      id: review.id,
      rating: review.rating,
      is_complaint: review.is_complaint,
    });

    // If it's a complaint (rating <= 2 stars), send to Slack
    if (review.is_complaint && slackWebhookUrl) {
      const customerName = review.is_anonymous 
        ? 'Anonymous Customer' 
        : (review.profiles?.display_name || 'Unknown Customer');

      const slackMessage = {
        text: "🚨 New Customer Complaint Received",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "🚨 New Customer Complaint"
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Service:*\n${review.services.title}`
              },
              {
                type: "mrkdwn",
                text: `*Rating:*\n${'⭐'.repeat(review.rating)} (${review.rating}/5)`
              },
              {
                type: "mrkdwn",
                text: `*Customer:*\n${customerName}`
              },
              {
                type: "mrkdwn",
                text: `*Date:*\n${new Date(review.created_at).toLocaleString()}`
              }
            ]
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Review:*\n${review.review_text || '_No review text provided_'}`
            }
          },
          {
            type: "divider"
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Review ID: ${review.id}`
              }
            ]
          }
        ]
      };

      console.log('Sending complaint to Slack...');
      
      const slackResponse = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage),
      });

      if (!slackResponse.ok) {
        console.error('Slack API error:', await slackResponse.text());
        throw new Error('Failed to send notification to Slack');
      }

      console.log('Complaint notification sent to Slack successfully');
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: review.is_complaint 
          ? 'Complaint notification sent to support team' 
          : 'Positive feedback recorded'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in handle-review-notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
