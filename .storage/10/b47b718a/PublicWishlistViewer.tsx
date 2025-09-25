import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users } from 'lucide-react';
import { usePublicWishlist } from '@/hooks/useFirestore';
import { ProductCard } from './ProductCard';

export const PublicWishlistViewer = () => {
  const [targetUserId, setTargetUserId] = useState('');
  const [searchUserId, setSearchUserId] = useState<string | null>(null);
  const { publicProducts, loading, error } = usePublicWishlist(searchUserId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetUserId.trim()) {
      setSearchUserId(targetUserId.trim());
    }
  };

  const handleClear = () => {
    setTargetUserId('');
    setSearchUserId(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          View Public Wishlist
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="userId" className="sr-only">User ID</Label>
            <Input
              id="userId"
              placeholder="Enter user ID to view their public wishlist"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={!targetUserId.trim()}>
            <Search className="h-4 w-4 mr-1" />
            Search
          </Button>
          {searchUserId && (
            <Button type="button" variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </form>

        {searchUserId && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Showing public wishlist for: <span className="font-mono font-medium">{searchUserId}</span>
            </div>
            
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading wishlist...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-600">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && publicProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No public items found for this user.</p>
              </div>
            )}

            {!loading && !error && publicProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showDeleteButton={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};