export const useBrands = (storeId: string) => {
  const { data, error, isLoading } = useSWR(`/api/${storeId}/brands`);
  return {
    brands: data,
    isLoading,
    error
  };
}; 