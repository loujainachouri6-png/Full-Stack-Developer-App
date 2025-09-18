import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import { AddProductForm } from '@/components/AddProductForm';
import { ProductCard } from '@/components/ProductCard';
import { PublicWishlistViewer } from '@/components/PublicWishlistViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Index() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { products, loading: productsLoading, error: productsError, deleteProduct } = useFirestore(user?.uid || null);

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast.success('Product removed from wishlist');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to remove product');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Initializing your wishlist...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication Error: {authError}</p>
          <p className="text-gray-600">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI-Powered Wishlist
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Simply paste a product URL and let AI extract all the important details for your wishlist
          </p>
          
          {user && (
            <div className="flex items-center justify-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Your ID:</span>
              <Badge variant="outline" className="font-mono">
                {user.uid}
              </Badge>
            </div>
          )}
        </div>

        {/* Add Product Form */}
        {user && <AddProductForm userId={user.uid} />}

        <Separator />

        {/* My Wishlist */}
        {user && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  My Wishlist ({products.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading your wishlist...</p>
                  </div>
                )}

                {productsError && (
                  <div className="text-center py-8 text-red-600">
                    <p>Error: {productsError}</p>
                  </div>
                )}

                {!productsLoading && !productsError && products.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Your wishlist is empty</p>
                    <p className="text-sm">Add your first product by pasting a URL above!</p>
                  </div>
                )}

                {!productsLoading && !productsError && products.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onDelete={handleDeleteProduct}
                        showDeleteButton={true}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Separator />

        {/* Public Wishlist Viewer */}
        <PublicWishlistViewer />
      </div>
    </div>
  );
}