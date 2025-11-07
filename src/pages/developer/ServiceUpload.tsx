import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Plus, X, ArrowLeft, Loader2 } from "lucide-react";

const PLATFORMS = [
  "Website",
  "Android App",
  "iOS App",
  "Mac App",
  "Windows App",
  "Linux App",
  "AI Service",
  "Automation Tool"
];

const ServiceUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [platform, setPlatform] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  // File upload state
  const [previewImages, setPreviewImages] = useState<File[]>([]);
  const [demoVideo, setDemoVideo] = useState<File | null>(null);
  const [appFile, setAppFile] = useState<File | null>(null);

  const handleAddFeature = () => {
    if (featureInput.trim() && features.length < 10) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (previewImages.length + files.length <= 5) {
      setPreviewImages([...previewImages, ...files]);
    } else {
      toast({
        title: "Too many images",
        description: "Maximum 5 preview images allowed",
        variant: "destructive",
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const filePath = `${userData.user.id}/${path}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to upload a service",
          variant: "destructive",
        });
        return;
      }

      // Upload preview images
      const imageUrls: string[] = [];
      for (let i = 0; i < previewImages.length; i++) {
        const url = await uploadFile(
          previewImages[i],
          'service-images',
          `${Date.now()}-${i}-${previewImages[i].name}`
        );
        imageUrls.push(url);
      }

      // Upload demo video if provided
      let demoVideoUrl = null;
      if (demoVideo) {
        demoVideoUrl = await uploadFile(
          demoVideo,
          'service-videos',
          `${Date.now()}-${demoVideo.name}`
        );
      }

      // Upload app file if provided
      let appFileUrl = null;
      if (appFile) {
        appFileUrl = await uploadFile(
          appFile,
          'service-files',
          `${Date.now()}-${appFile.name}`
        );
      }

      // Insert service into database
      const { error: insertError } = await supabase.from('services').insert({
        developer_id: userData.user.id,
        platform,
        title,
        description,
        category: category || null,
        price: parseFloat(price),
        features,
        tags,
        preview_images: imageUrls,
        demo_video_url: demoVideoUrl,
        app_file_url: appFileUrl,
        status,
      });

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: `Service ${status === 'draft' ? 'saved as draft' : 'published'} successfully`,
      });

      navigate('/developer/dashboard');
    } catch (error: any) {
      console.error('Error uploading service:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Upload Service - OWSCORP Developer Portal</title>
        <meta name="description" content="Upload and publish your digital services on OWSCORP marketplace" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/developer/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Upload New Service</h1>
            <p className="text-muted-foreground">
              Fill in the details below to list your service on the marketplace
            </p>
          </div>

          <form className="space-y-6">
            {/* Platform Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Platform & Category</CardTitle>
                <CardDescription>Select the target platform for your service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform *</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category (optional)</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., E-commerce, Productivity, Entertainment"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service Information */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>Provide detailed information about your service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Service Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your service in detail..."
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>Add key features of your service (max 10)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    placeholder="Enter a feature"
                    disabled={features.length >= 10}
                  />
                  <Button
                    type="button"
                    onClick={handleAddFeature}
                    disabled={!featureInput.trim() || features.length >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Add tags to help users discover your service (max 5)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Enter a tag"
                    disabled={tags.length >= 5}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || tags.length >= 5}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* File Uploads */}
            <Card>
              <CardHeader>
                <CardTitle>Media & Files</CardTitle>
                <CardDescription>Upload preview images, demo video, and application files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview Images */}
                <div>
                  <Label htmlFor="preview-images">Preview Images (max 5)</Label>
                  <div className="mt-2">
                    <Input
                      id="preview-images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={previewImages.length >= 5}
                    />
                  </div>
                  {previewImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {previewImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Demo Video */}
                <div>
                  <Label htmlFor="demo-video">Demo Video (optional)</Label>
                  <div className="mt-2">
                    <Input
                      id="demo-video"
                      type="file"
                      accept="video/*"
                      onChange={(e) => setDemoVideo(e.target.files?.[0] || null)}
                    />
                  </div>
                  {demoVideo && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {demoVideo.name}
                    </p>
                  )}
                </div>

                {/* App File */}
                <div>
                  <Label htmlFor="app-file">Application File (optional)</Label>
                  <div className="mt-2">
                    <Input
                      id="app-file"
                      type="file"
                      accept=".zip,.rar,.7z"
                      onChange={(e) => setAppFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  {appFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {appFile.name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={isSubmitting || !platform || !title || !description || !price}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save as Draft'
                )}
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, 'published')}
                disabled={isSubmitting || !platform || !title || !description || !price}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Publish Service
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ServiceUpload;
