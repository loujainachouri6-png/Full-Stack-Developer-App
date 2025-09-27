# AI-Powered Product Wishlist - MVP Implementation

## Core Features to Implement:
1. **User Authentication**: Anonymous Firebase auth with optional custom token
2. **URL Input & Processing**: Input field for product URLs with AI extraction
3. **AI Integration**: Gemini API integration for product data extraction
4. **Wishlist Display**: Card-based layout showing products
5. **CRUD Operations**: Add/delete products from wishlist
6. **Public Sharing**: View other users' public wishlists
7. **Real-time Updates**: Firestore real-time listeners

## Files to Create:
1. `src/pages/Index.tsx` - Main application component (rewrite)
2. `src/components/ProductCard.tsx` - Individual product display
3. `src/components/AddProductForm.tsx` - URL input and add functionality
4. `src/components/PublicWishlistViewer.tsx` - View public wishlists
5. `src/hooks/useFirestore.ts` - Firestore operations hook
6. `src/hooks/useAuth.ts` - Authentication hook
7. `src/lib/gemini.ts` - AI integration utilities
8. `index.html` - Update title

## Data Structure:
- Private: `/artifacts/{__app_id}/users/{userId}/wishlist`
- Public: `/artifacts/{__app_id}/public/data/wishlists`
- Fields: productName, description, imageUrl, originalUrl, isPublic, timestamp

## Key Requirements:
- Single-page React app with Shadcn-UI components
- Firebase Auth (anonymous + custom token support)
- Firestore real-time updates
- Gemini API for product extraction
- Responsive design
- Error handling for invalid URLs/network issues