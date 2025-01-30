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
  const imageSource = imageUrl.startsWith('http') ? imageUrl : `/${imageUrl}`;

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10" />
      <div
        style={{ backgroundImage: `url(${imageSource})` }}
        className={cn(
          'relative aspect-[2.4/1] overflow-hidden bg-cover bg-center bg-no-repeat',
          className
        )}
      >
        <div className="h-full w-full flex flex-col justify-center items-center text-center">
          <div className="max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-bold text-3xl sm:text-5xl lg:text-6xl text-white drop-shadow-md mb-4">
              {label}
            </h1>
            {description && (
              <p className="text-lg sm:text-xl text-white drop-shadow-md max-w-xl mx-auto">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
