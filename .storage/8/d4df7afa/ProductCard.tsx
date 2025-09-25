import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ExternalLink } from 'lucide-react';
import { Product } from '@/hooks/useFirestore';

interface ProductCardProps {
  product: Product;
  onDelete?: (id: string) => void;
  showDeleteButton?: boolean;
}

export const ProductCard = ({ product, onDelete, showDeleteButton = true }: ProductCardProps) => {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(product.id);
    }
  };

  const handleVisitProduct = () => {
    window.open(product.originalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {product.productName}
          </CardTitle>
          {product.isPublic && (
            <Badge variant="secondary" className="shrink-0">
              Public
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {product.imageUrl && product.imageUrl !== '/placeholder-product.jpg' && (
          <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100">
            <img
              src={product.imageUrl}
              alt={product.productName}
              className="h-full w-full object-cover transition-transform hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-product.jpg';
              }}
            />
          </div>
        )}
        
        <p className="text-sm text-gray-600 line-clamp-3">
          {product.description}
        </p>
        
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVisitProduct}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Visit
          </Button>
          
          {showDeleteButton && onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="px-3"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};