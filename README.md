import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

// Item class
class Item {
    private int id;
    private String name;
    private double price;

    public Item(int id, String name, double price) {
        this.id = id;
        this.name = name.toLowerCase(); // normalize
        this.price = price;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }

    public void displayItem() {
        System.out.printf("%2d. %-10s - Rs.%.2f\n", id, capitalize(name), price);
    }

    public static String capitalize(String str) {
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}

// SuperMarket class
class SuperMarket {
    private Item[] items = new Item[20];
    private Map<String, Item> itemMap = new HashMap<>();

    public SuperMarket() {
        items[0] = new Item(1, "Banana", 30.0);
        items[1] = new Item(2, "Apple", 120.0);
        items[2] = new Item(3, "Milk", 50.0);
        items[3] = new Item(4, "Cheese", 90.0);
        items[4] = new Item(5, "Bread", 40.0);
        items[5] = new Item(6, "Butter", 60.0);
        items[6] = new Item(7, "Eggs", 70.0);
        items[7] = new Item(8, "Chicken", 250.0);
        items[8] = new Item(9, "Rice", 80.0);
        items[9] = new Item(10, "Wheat", 40.0);
        items[10] = new Item(11, "Oil", 150.0);
        items[11] = new Item(12, "Salt", 20.0);
        items[12] = new Item(13, "Sugar", 40.0);
        items[13] = new Item(14, "Coffee", 140.0);
        items[14] = new Item(15, "Tea", 100.0);
        items[15] = new Item(16, "Soap", 45.0);
        items[16] = new Item(17, "Shampoo", 110.0);
        items[17] = new Item(18, "Toothpaste", 50.0);
        items[18] = new Item(19, "Biscuits", 30.0);
        items[19] = new Item(20, "Juice", 60.0);

        for (Item item : items) {
            itemMap.put(item.getName(), item);
        }
    }

    public void showItems() {
        System.out.println("\nAvailable Items (type 'STOP' to checkout, 'CART' to view cart):");
        for (Item item : items) {
            item.displayItem();
        }
    }

    public Item getItemById(int id) {
        if (id >= 1 && id <= 20) {
            return items[id - 1];
        }
        return null;
    }

    public Map<String, Item> getItemMap() {
        return itemMap;
    }
}

// Bill class
class Bill {
    private Map<String, Integer> cart = new LinkedHashMap<>();
    private Map<String, Item> itemDetails;
    private double subtotal = 0;

    public Bill(Map<String, Item> itemDetails) {
        this.itemDetails = itemDetails;
    }

    public void addItem(String name, int qty) {
        cart.put(name, cart.getOrDefault(name, 0) + qty);
    }

    public void removeItem(String name) {
        if (cart.containsKey(name)) {
            cart.remove(name);
            System.out.println("✅ Removed " + Item.capitalize(name) + " from cart.");
        } else {
            System.out.println("⚠️ Item not found in cart.");
        }
    }

    public void showCart() {
        System.out.println("\n🛒 --------- Your Cart ---------");
        if (cart.isEmpty()) {
            System.out.println("Your cart is empty.");
            return;
        }

        subtotal = 0;
        for (String name : cart.keySet()) {
            int qty = cart.get(name);
            Item item = itemDetails.get(name);
            double price = item.getPrice();
            double total = qty * price;
            subtotal += total;
            System.out.printf("%-10s x%-2d @ Rs.%.2f = Rs.%.2f\n", Item.capitalize(name), qty, price, total);
        }

        System.out.printf("Current Subtotal: Rs.%.2f\n", subtotal);
    }

    public boolean isCartEmpty() {
        return cart.isEmpty();
    }

    public void printFinalBill(String customerName) {
        System.out.println("\n=========== The Daily Grocer - BILL ===========");

        LocalDateTime now = LocalDateTime.now();
        String date = now.format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"));
        System.out.println("Customer: " + customerName);
        System.out.println("Date    : " + date);

        System.out.println("\nItems Purchased:");
        if (cart.isEmpty()) {
            System.out.println("No items purchased.");
            return;
        }

        subtotal = 0;
        for (String name : cart.keySet()) {
            int qty = cart.get(name);
            Item item = itemDetails.get(name);
            double price = item.getPrice();
            double cost = qty * price;
            subtotal += cost;
            System.out.printf("%-10s x%-2d @ Rs.%.2f = Rs.%.2f\n", Item.capitalize(name), qty, price, cost);
        }

        System.out.printf("\nSubtotal: Rs.%.2f", subtotal);

        double discount = 0;
        if (subtotal > 500) {
            discount = subtotal * 0.10;
            subtotal -= discount;
            System.out.printf("\nDiscount (10%%): -Rs.%.2f", discount);
        }

        double gst = subtotal * 0.16;
        double total = subtotal + gst;

        System.out.printf("\nGST (16%%): Rs.%.2f", gst);
        System.out.printf("\nTotal Payable: Rs.%.2f", total);
        System.out.println("\n===============================================");
        System.out.println("Thank you for shopping at The Daily Grocer!");
    }
}

// Main class
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        SuperMarket market = new SuperMarket();
        Bill bill = new Bill(market.getItemMap());

        System.out.println("Welcome to The Daily Grocer!");
        System.out.print("Please enter your name to continue: ");
        String customerName = new Scanner(System.in).nextLine();

        market.showItems();

        while (true) {
            System.out.print("\nEnter Item Number, 'CART' to view cart, or 'STOP' to checkout: ");
            String input = sc.next();

            if (input.equalsIgnoreCase("STOP")) {
                break;
            } else if (input.equalsIgnoreCase("CART")) {
                bill.showCart();
                if (!bill.isCartEmpty()) {
                    System.out.print("Do you want to remove any item? (yes/no): ");
                    String reply = sc.next();
                    if (reply.equalsIgnoreCase("yes")) {
                        System.out.print("Enter the name of the item to remove: ");
                        sc.nextLine(); // clear buffer
                        String itemName = sc.nextLine().toLowerCase();
                        bill.removeItem(itemName);
                        bill.showCart();
                    }
                }
                continue;
            }

            int itemId;
            try {
                itemId = Integer.parseInt(input);
            } catch (NumberFormatException e) {
                System.out.println("Invalid input. Try again.");
                continue;
            }

            Item item = market.getItemById(itemId);
            if (item != null) {
                System.out.print("Enter quantity of " + Item.capitalize(item.getName()) + ": ");
                int quantity = sc.nextInt();
                bill.addItem(item.getName(), quantity);
            } else {
                System.out.println("Invalid item number.");
            }
        }

        bill.printFinalBill(customerName);
        sc.close();
    }
}
