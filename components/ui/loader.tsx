"use client";

export const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 rounded-full absolute border-4 border-solid border-primary opacity-20"></div>
        <div className="w-10 h-10 rounded-full animate-spin absolute border-4 border-solid border-primary border-t-transparent"></div>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">Loading...</div>
    </div>
  );
};
