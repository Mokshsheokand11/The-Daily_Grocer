package Backend;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        SuperMarket market = new SuperMarket();
        Bill bill = new Bill(market.getItemMap());

        System.out.print("Enter your name: ");
        String customerName = sc.nextLine();

        market.showItems();

        while (true) {
            System.out.print("Enter item number or STOP: ");
            String input = sc.next();

            if (input.equalsIgnoreCase("STOP")) break;

            int id = Integer.parseInt(input);
            Item item = market.getItemById(id);

            if (item != null) {
                System.out.print("Quantity: ");
                int qty = sc.nextInt();
                bill.addItem(item.getName(), qty);
            }
        }

        bill.printFinalBill(customerName);
        sc.close();
    }
}
