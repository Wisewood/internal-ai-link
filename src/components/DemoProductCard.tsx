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
    <Card
      className="w-56 flex-shrink-0 overflow-hidden transition-colors"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#ffffff",
      }}
    >
      <div
        className="relative h-36 flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-1"
            loading="lazy"
          />
        ) : (
          <Package className="h-12 w-12" style={{ color: "rgba(255,255,255,0.4)" }} />
        )}
        <div
          className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
          style={{ background: "#06B6D4", color: "#0a0a0a" }}
        >
          <TrendingDown className="h-3 w-3" />
          Save ~{savingsPercent}%
        </div>
      </div>
      <CardContent className="p-3 space-y-1.5">
        <h4 className="text-sm font-medium line-clamp-2 leading-tight min-h-[2.5rem]" style={{ color: "#ffffff" }}>
          {product.name}
        </h4>
        {(product.category || product.quantity) && (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            {product.category}
            {product.category && product.quantity ? " · " : ""}
            {product.quantity ? `${product.quantity.toLocaleString()} pcs` : ""}
          </p>
        )}
        <p className="text-sm font-semibold" style={{ color: "#06B6D4" }}>
          ~{savingsPercent}% below market
        </p>
      </CardContent>
    </Card>
  );
};
