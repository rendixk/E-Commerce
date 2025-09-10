## Code for buyer 
These functions are specifically designed for the buyer's functionality.
- cartController.ts: All of its functions (addToCart, getCart, deleteCartItem) are intended for managing the buyer's shopping cart.
- userController.ts: All of its functions (createProfile, getProfile, updateProfile, getBalance, topupBalance) are used by all users, including buyers, to manage their accounts and balance.
- transactionController.ts: The createTransaction and transactionHistory functions (when the role is buyer) specifically handle the transaction flow and purchase history for buyers.

---

## Code for seller
These functions are intended for the seller's functionality, which involves managing products and transactions.
- categoryController.ts: All of its functions (createCategory, updateCategory, deleteCategory) can only be accessed by sellers to manage product categories.
- productController.ts: All of its functions (createProduct, updateProduct, deleteProduct) can only be accessed by sellers to manage their products.
- transactionController.ts: The confirmTransaction and transactionHistory functions (when the role is seller) are for sellers to manage and view the transaction history related to their store.

---

## Code for both roles
These functions can be accessed by both buyer and seller roles.
- authController.ts: The registerBuyer, registerSeller, and login functions are used by both roles for authentication.
- productController.ts: The getAllProduct and getProductById functions can be accessed by anyone (even without authentication) to view products.
- userController.ts: All of its functions can also be used by sellers, since a seller also has a profile and a balance.