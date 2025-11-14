import { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/home/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Plus, Loader2 } from "lucide-react";

interface PricingTier {
  name: string;
  price: number;
  features: string[];
}

const ServiceUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [platform, setPlatform] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([""]);
  const [basePrice, setBasePrice] = useState("");
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [tags, setTags] = useState<string[]>([""]);
  
  // File uploads
  const [previewImages, setPreviewImages] = useState<File[]>([]);
  const [demoVideo, setDemoVideo] = useState<File | null>(null);
  const [appFile, setAppFile] = useState<File | null>(null);
  const [status, setStatus] = useState("draft");

  const platforms = [
    { value: "website", label: "Website" },
    { value: "android", label: "Android App" },
    { value: "ios", label: "iOS App" },
    { value: "mac", label: "Mac App" },
    { value: "windows", label: "Windows App" },
    { value: "linux", label: "Linux App" },
    { value: "ai", label: "AI Service" },
    { value: "cloud", label: "Automation Tool" }
  ];

  const categories = [
    "Business",
    "Productivity",
    "E-commerce",
    "Education",
    "Entertainment",
    "Health & Fitness",
    "Social Media",
    "Utilities",
    "Other"
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPreviewImages([...previewImages, ...Array.from(e.target.files)]);
    }
  };

  const removeImage = (index: number) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const addTag = () => {
    setTags([...tags, ""]);
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to upload a service.",
          variant: "destructive",
        });
        return;
      }

      // Upload files
      const imageUrls: string[] = [];
      for (const image of previewImages) {
        const path = `${user.id}/${Date.now()}_${image.name}`;
        const url = await uploadFile(image, 'service-images', path);
        imageUrls.push(url);
      }

      let demoVideoUrl = null;
      if (demoVideo) {
        const path = `${user.id}/${Date.now()}_${demoVideo.name}`;
        demoVideoUrl = await uploadFile(demoVideo, 'service-videos', path);
      }

      let appFileUrl = null;
      if (appFile) {
        const path = `${user.id}/${Date.now()}_${appFile.name}`;
        appFileUrl = await uploadFile(appFile, 'service-files', path);
      }

      // Create service record
      const { error } = await supabase
        .from('services')
        .insert([{
          developer_id: user.id,
          platform,
          category,
          title,
          description,
          features: features.filter(f => f.trim() !== ''),
          price: parseFloat(basePrice),
          pricing_tiers: pricingTiers as any,
          preview_images: imageUrls,
          demo_video_url: demoVideoUrl,
          app_file_url: appFileUrl,
          status,
          tags: tags.filter(t => t.trim() !== ''),
        }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Service uploaded successfully.",
      });

      navigate('/developer/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, 4));
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1));

  return (
    <>
      <Helmet>
        <title>Upload Service - OWSCORP Developer Portal</title>
        <meta name="description" content="Upload your digital service to the OWSCORP marketplace" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Upload New Service</h1>
            <p className="text-muted-foreground">Share your digital solution with customers</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Tell us about your service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform *</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Service Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Professional E-commerce Website"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your service in detail..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Features</Label>
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Feature description"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFeature(index)}
                        disabled={features.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addFeature} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  {tags.map((tag, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        placeholder="Tag (e.g., responsive, modern)"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeTag(index)}
                        disabled={tags.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tag
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Files & Media */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Files & Media</CardTitle>
                <CardDescription>Upload preview images, demo video, and application files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Preview Images (Max 10MB each)</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload images</p>
                    </Label>
                  </div>
                  {previewImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {previewImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demo-video">Demo Video (Optional, Max 500MB)</Label>
                  <Input
                    id="demo-video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setDemoVideo(e.target.files?.[0] || null)}
                  />
                  {demoVideo && (
                    <p className="text-sm text-muted-foreground">Selected: {demoVideo.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app-file">Application File (Optional, Max 100MB)</Label>
                  <Input
                    id="app-file"
                    type="file"
                    onChange={(e) => setAppFile(e.target.files?.[0] || null)}
                  />
                  {appFile && (
                    <p className="text-sm text-muted-foreground">Selected: {appFile.name}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Pricing */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing Configuration</CardTitle>
                <CardDescription>Set your pricing and packages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="base-price">Base Price (USD) *</Label>
                  <Input
                    id="base-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="99.99"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Publication */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Publication Settings</CardTitle>
                <CardDescription>Review and publish your service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft (Save for later)</SelectItem>
                      <SelectItem value="published">Published (Go live immediately)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold">Review Your Service</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Platform:</span> {platform}</p>
                    <p><span className="font-medium">Category:</span> {category}</p>
                    <p><span className="font-medium">Title:</span> {title}</p>
                    <p><span className="font-medium">Base Price:</span> ${basePrice}</p>
                    <p><span className="font-medium">Images:</span> {previewImages.length}</p>
                    <p><span className="font-medium">Demo Video:</span> {demoVideo ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">App File:</span> {appFile ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/developer/dashboard')}
              >
                Cancel
              </Button>
              {currentStep < 4 ? (
                <Button onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {status === 'published' ? 'Publish Service' : 'Save as Draft'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceUpload;