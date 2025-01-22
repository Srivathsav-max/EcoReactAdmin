# Files to Delete

1. Remove duplicate API routes:
```
app/api/[storeId]/(storefront)/store/route.ts
app/api/[storeId]/store/route.ts
```

2. Remove old storefront directory:
```
app/(storefront)/ (entire directory)
```

3. Remove unused auth files:
```
app/(auth)/sign-in/page.tsx
app/(auth)/sign-up/page.tsx
```

4. Remove clerk auth middleware:
```
middleware.ts (old version with clerk)
```

5. Remove old environment variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY