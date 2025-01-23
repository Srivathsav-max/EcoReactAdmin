import { cn } from "@/lib/utils";
import Link from "next/link";

interface BannerConfig {
  label: string;
  imageUrl: string;
  link?: string;
  buttonText?: string;
  className?: string;
}

interface BannerComponentProps {
  data: BannerConfig;
}

export const BannerComponent: React.FC<BannerComponentProps> = ({
  data
}) => {
  const { label, imageUrl, link, buttonText = "Shop Now", className } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div
        style={{ backgroundImage: `url(${imageUrl})` }}
        className={cn(
          'rounded-xl relative aspect-[2/1] overflow-hidden bg-cover',
          className
        )}
      >
        <div className="h-full w-full flex flex-col justify-center items-center text-center gap-y-4">
          <div className="font-bold text-2xl sm:text-3xl lg:text-4xl text-white bg-black/50 p-4 rounded-lg">
            {label}
          </div>
          {link && (
            <Link
              href={link}
              className="bg-white px-6 py-2 rounded-full text-black font-semibold hover:bg-gray-100 transition"
            >
              {buttonText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};