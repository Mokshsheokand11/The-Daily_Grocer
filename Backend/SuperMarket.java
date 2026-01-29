package Backend;

import java.util.*;

public class SuperMarket {
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
        System.out.println("\nAvailable Items:");
        for (Item item : items) {
            item.displayItem();
        }
    }

    public Item getItemById(int id) {
        if (id >= 1 && id <= 20) return items[id - 1];
        return null;
    }

    public Map<String, Item> getItemMap() {
        return itemMap;
    }
}
