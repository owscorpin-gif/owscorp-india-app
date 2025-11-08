import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, X, Plus, Loader2, Star, TrendingUp } from "lucide-react";

const PLATFORMS = [
  "Website", "Android App", "iOS App", "Mac App", 
  "Windows App", "Linux App", "AI Service", "Automation Tool"
];

const ServiceManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Service data
  const [platform, setPlatform] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  
  // Files
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [demoVideo, setDemoVideo] = useState<File | null>(null);
  const [existingDemoVideo, setExistingDemoVideo] = useState<string | null>(null);
  const [appFile, setAppFile] = useState<File | null>(null);
  const [existingAppFile, setExistingAppFile] = useState<string | null>(null);

  // Mock reviews and analytics
  const mockReviews = [
    { id: 1, customer: "John Doe", rating: 5, comment: "Excellent service!", date: "2024-01-15" },
    { id: 2, customer: "Jane Smith", rating: 4, comment: "Great work, minor improvements needed", date: "2024-01-10" },
  ];

  const mockAnalytics = {
    totalViews: 1245,
    totalSales: 38,
    revenue: 3724.50,
    averageRating: 4.7,
    conversionRate: 3.05
  };

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setPlatform(data.platform);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category || "");
        setPrice(data.price.toString());
        setFeatures(data.features || []);
        setTags(data.tags || []);
        setStatus(data.status as 'draft' | 'published');
        setExistingImages(data.preview_images || []);
        setExistingDemoVideo(data.demo_video_url);
        setExistingAppFile(data.app_file_url);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate('/developer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const filePath = `${userData.user.id}/${path}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload new images
      const imageUrls = [...existingImages];
      for (let i = 0; i < newImages.length; i++) {
        const url = await uploadFile(
          newImages[i],
          'service-images',
          `${Date.now()}-${i}-${newImages[i].name}`
        );
        imageUrls.push(url);
      }

      // Upload new demo video if provided
      let demoVideoUrl = existingDemoVideo;
      if (demoVideo) {
        demoVideoUrl = await uploadFile(
          demoVideo,
          'service-videos',
          `${Date.now()}-${demoVideo.name}`
        );
      }

      // Upload new app file if provided
      let appFileUrl = existingAppFile;
      if (appFile) {
        appFileUrl = await uploadFile(
          appFile,
          'service-files',
          `${Date.now()}-${appFile.name}`
        );
      }

      const { error } = await supabase
        .from('services')
        .update({
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
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Service updated successfully",
      });

      setNewImages([]);
      setDemoVideo(null);
      setAppFile(null);
      fetchService();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
    const totalImages = existingImages.length + newImages.length + files.length;
    
    if (totalImages <= 5) {
      setNewImages([...newImages, ...files]);
    } else {
      toast({
        title: "Too many images",
        description: "Maximum 5 preview images allowed",
        variant: "destructive",
      });
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Service - {title} | OWSCORP</title>
        <meta name="description" content={`Manage ${title} on OWSCORP marketplace`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/developer/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{title}</h1>
            <div className="flex items-center gap-4">
              <Badge variant={status === 'published' ? 'default' : 'secondary'}>
                {status}
              </Badge>
              <span className="text-muted-foreground">{platform}</span>
            </div>
          </div>

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="files">Files & Media</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Information</CardTitle>
                  <CardDescription>Update your service details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger id="platform">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., E-commerce, Productivity"
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">Service Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as 'draft' | 'published')}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                  <CardDescription>Add key features (max 10)</CardDescription>
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

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>Add tags (max 5)</CardDescription>
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
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview Images</CardTitle>
                  <CardDescription>Manage your service preview images (max 5)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={existingImages.length + newImages.length >= 5}
                    />
                  </div>
                  
                  {existingImages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Current Images</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {existingImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveExistingImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {newImages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">New Images (not saved yet)</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {newImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(img)}
                              alt={`New Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveNewImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Demo Video</CardTitle>
                  <CardDescription>Upload or replace demo video</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {existingDemoVideo && (
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Current video uploaded</p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setDemoVideo(e.target.files?.[0] || null)}
                  />
                  {demoVideo && (
                    <p className="text-sm text-muted-foreground">
                      New video selected: {demoVideo.name}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Application File</CardTitle>
                  <CardDescription>Upload or replace application file</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {existingAppFile && (
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Current file uploaded</p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept=".zip,.rar,.7z"
                    onChange={(e) => setAppFile(e.target.files?.[0] || null)}
                  />
                  {appFile && (
                    <p className="text-sm text-muted-foreground">
                      New file selected: {appFile.name}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>View feedback from your customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockReviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium">{review.customer}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{review.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell>{review.comment}</TableCell>
                          <TableCell className="text-muted-foreground">{review.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockAnalytics.totalViews}</div>
                    <p className="text-xs text-muted-foreground">All time views</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockAnalytics.totalSales}</div>
                    <p className="text-xs text-muted-foreground">All time sales</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${mockAnalytics.revenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Total earnings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockAnalytics.averageRating}</div>
                    <p className="text-xs text-muted-foreground">Out of 5 stars</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockAnalytics.conversionRate}%</div>
                    <p className="text-xs text-muted-foreground">Views to sales</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => navigate('/developer/dashboard')}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceManagement;
