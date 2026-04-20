import { useMemo } from "react";
import { Package, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface DemoProduct {
  ref: string;
  name: string;
  image?: string | null;
  category?: string;
  quantity?: number;
}

interface Props {
  product: DemoProduct;
}

export const DemoProductCard = ({ product }: Props) => {
  // Deterministic 20–40% savings per product name, so it stays stable across re-renders.
  const savingsPercent = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < product.name.length; i++) {
      hash = (hash << 5) - hash + product.name.charCodeAt(i);
      hash |= 0;
    }
    return 20 + (Math.abs(hash) % 21);
  }, [product.name]);

  return (
    <Card className="w-56 flex-shrink-0 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-36 bg-muted flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-1"
            loading="lazy"
          />
        ) : (
          <Package className="h-12 w-12 text-muted-foreground" />
        )}
        <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <TrendingDown className="h-3 w-3" />
          Save ~{savingsPercent}%
        </div>
      </div>
      <CardContent className="p-3 space-y-1.5">
        <h4 className="text-sm font-medium line-clamp-2 leading-tight min-h-[2.5rem]">
          {product.name}
        </h4>
        {(product.category || product.quantity) && (
          <p className="text-xs text-muted-foreground">
            {product.category}
            {product.category && product.quantity ? " · " : ""}
            {product.quantity ? `${product.quantity.toLocaleString()} pcs` : ""}
          </p>
        )}
        <p className="text-sm font-semibold text-green-600">
          ~{savingsPercent}% below market
        </p>
      </CardContent>
    </Card>
  );
};
