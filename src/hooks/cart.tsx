import AsyncStorage from '@react-native-community/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Alert } from 'react-native';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartProduct = await AsyncStorage.getItem('@GoMarketPlace:products');
      if (cartProduct) {
        setProducts(JSON.parse(cartProduct));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const contains = products.find((prod: Product) => product.id === prod.id);

      const addProduct = { ...product, quantity: 1 };

      if (!contains) {
        setProducts([...products, addProduct]);
        await AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async (id: string) => {
      const listProduct = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );

      setProducts(listProduct);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(listProduct),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async (id: string) => {
      const listProduct = products
        .map(product => {
          let item = product;
          if (product.id === id) {
            item = { ...product, quantity: product.quantity - 1 };
          }

          return item;
        })
        .filter(product => product.quantity > 0);

      setProducts(listProduct);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(listProduct),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
