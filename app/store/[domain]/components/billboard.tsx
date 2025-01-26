import { cn } from "@/lib/utils";

interface BillboardConfig {
  label: string;
  imageUrl: string;
  description?: string;
  className?: string;
}

interface BillboardProps {
  data: BillboardConfig;
}

export const Billboard: React.FC<BillboardProps> = ({
  data
}) => {
  const { label, imageUrl, description, className } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 rounded-xl overflow-hidden">
      <div
        style={{ backgroundImage: `url(${imageUrl})` }}
        className={cn(
          'rounded-xl relative aspect-square md:aspect-[2.4/1] overflow-hidden bg-cover',
          className
        )}
      >
        <div className="h-full w-full flex flex-col justify-center items-center text-center gap-y-8">
          <div className="font-bold text-3xl sm:text-5xl lg:text-6xl sm:max-w-xl max-w-xs text-white bg-black/50 p-4 rounded-lg">
            {label}
          </div>
          {description && (
            <div className="text-white bg-black/50 p-4 rounded-lg max-w-xs sm:max-w-xl">
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};