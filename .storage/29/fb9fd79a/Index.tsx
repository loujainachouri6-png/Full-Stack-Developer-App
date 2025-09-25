import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Globe, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { AddProductForm } from '@/components/AddProductForm';
import { ProductCard } from '@/components/ProductCard';
import { PublicWishlistViewer } from '@/components/PublicWishlistViewer';

export default function Index() {
  const { user, loading, error, signInAnonymous, forceSkipAuth } = useAuth();
  const { products, loading: firestoreLoading, addProduct, deleteProduct } = useFirestore(user?.uid || null);
  const [viewingUserId, setViewingUserId] = useState<string>('');

  // Enhanced error state with multiple options
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">{error}</p>
            <div className="space-y-2">
              <Button onClick={signInAnonymous} className="w-full">
                <User className="mr-2 h-4 w-4" />
                Try Anonymous Sign-In
              </Button>
              <Button onClick={forceSkipAuth} variant="outline" className="w-full">
                Continue as Demo User
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="ghost" 
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Enhanced loading state with timeout options
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              This should only take a few seconds...
            </p>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 text-center mb-3">
                Taking too long?
              </p>
              <div className="space-y-2">
                <Button onClick={signInAnonymous} variant="outline" size="sm" className="w-full">
                  <User className="mr-2 h-3 w-3" />
                  Sign In Anonymously
                </Button>
                <Button onClick={forceSkipAuth} variant="ghost" size="sm" className="w-full">
                  Continue as Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>AI-Powered Product Wishlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Sign in to start building your wishlist with AI-powered product extraction
            </p>
            <div className="space-y-2">
              <Button onClick={signInAnonymous} className="w-full">
                <User className="mr-2 h-4 w-4" />
                Sign In Anonymously
              </Button>
              <Button onClick={forceSkipAuth} variant="outline" className="w-full">
                Try Demo Mode
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main app content
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI-Powered Product Wishlist
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              <User className="mr-1 h-3 w-3" />
              User ID: {user.uid}
            </Badge>
            {user.uid.includes('demo') && (
              <Badge variant="outline" className="px-3 py-1">
                Demo Mode
              </Badge>
            )}
          </div>
        </div>

        {/* Add Product Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Add New Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddProductForm onAddProduct={addProduct} />
          </CardContent>
        </Card>

        {/* My Wishlist */}
        <Card>
          <CardHeader>
            <CardTitle>My Wishlist ({products.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            {firestoreLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading wishlist...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Your wishlist is empty</p>
                <p className="text-sm">Add a product URL above to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDelete={() => deleteProduct(product.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Public Wishlist Viewer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              View Public Wishlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PublicWishlistViewer userId={viewingUserId.trim() || null} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}