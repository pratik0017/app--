import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { File, Clock, Wrench } from "lucide-react";

const FileSharing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <Card className="border-border shadow-card">
            <CardHeader className="pb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mb-6">
                <File className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-4xl font-bold text-foreground mb-4">
                File Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <div className="flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-primary mr-2" />
                <span className="text-lg font-semibold text-primary">Coming Soon</span>
              </div>
              <p className="text-xl text-muted-foreground mb-6">
                Secure file uploads, version control, collaborative editing, and cloud storage 
                integration are being developed for seamless file management.
              </p>
              <div className="flex items-center justify-center text-muted-foreground">
                <Wrench className="w-5 h-5 mr-2" />
                <span>Development in Progress</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FileSharing;