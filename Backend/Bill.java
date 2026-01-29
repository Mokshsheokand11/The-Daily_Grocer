package Backend;

import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Bill {
    private Map<String, Integer> cart = new LinkedHashMap<>();
    private Map<String, Item> itemDetails;
    private double subtotal = 0;

    public Bill(Map<String, Item> itemDetails) {
        this.itemDetails = itemDetails;
    }

    public void addItem(String name, int qty) {
        cart.put(name, cart.getOrDefault(name, 0) + qty);
    }

    public void showCart() {
        System.out.println("\n🛒 Your Cart:");
        subtotal = 0;

        for (String name : cart.keySet()) {
            int qty = cart.get(name);
            Item item = itemDetails.get(name);
            double total = qty * item.getPrice();
            subtotal += total;

            System.out.printf("%s x%d = Rs.%.2f\n",
                    Item.capitalize(name), qty, total);
        }
        System.out.printf("Subtotal: Rs.%.2f\n", subtotal);
    }

    public boolean isCartEmpty() {
        return cart.isEmpty();
    }

    public void printFinalBill(String customerName) {
        System.out.println("\n=========== BILL ===========");

        String date = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"));

        System.out.println("Customer: " + customerName);
        System.out.println("Date    : " + date);

        showCart();

        double gst = subtotal * 0.16;
        double total = subtotal + gst;

        System.out.printf("GST (16%%): Rs.%.2f\n", gst);
        System.out.printf("Total Payable: Rs.%.2f\n", total);
    }
}
