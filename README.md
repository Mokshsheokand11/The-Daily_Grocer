# 🛒 Supermarket Billing System (Java)

A **console-based supermarket billing application** built using **Core Java**.  
This project demonstrates **Object-Oriented Programming (OOP)** concepts, **Collections**, and **clean code structure**.

---

##  Project Overview

This application simulates a simple supermarket billing system where:
- A customer can view available items
- Select items by item number
- Enter quantity
- View the final bill with GST calculation

The program runs completely in the **VS Code terminal**.

---

##  Features

- Display list of available grocery items
- Add items to cart using item number
- Quantity-based price calculation
- Subtotal and GST (16%) calculation
- Final bill generation with date & time
- Clean separation of responsibilities using classes

---

##  Concepts Used

- **Core Java**
- **OOP Principles**
  - Classes & Objects
  - Encapsulation
- **Java Collections**
  - `HashMap`
  - `LinkedHashMap`
- **Arrays**
- **User Input Handling (Scanner)**
- **Date & Time API (`LocalDateTime`)**
- **Git & GitHub**

---

##  Project Structure

SuperMarketProject
└── Backend
├── Item.java
├── SuperMarket.java
├── Bill.java
└── Main.java


###  Class Responsibilities

- **Item.java**
  - Represents a product (id, name, price)

- **SuperMarket.java**
  - Stores all items
  - Displays available products

- **Bill.java**
  - Manages cart
  - Calculates subtotal, GST, and final amount

- **Main.java**
  - Entry point of the program
  - Handles user interaction

---

##  How to Run the Project

### Prerequisites
- Java JDK 8 or above
- VS Code with Java Extension Pack

### Steps

1. Clone the repository
```bash
git clone https://github.com/yourusername/Supermarket-.git

### Sample Output
=========== BILL ===========
Customer: MOKSH SHEOKAND
Date    : 30-01-2026 02:26:43

? Your Cart:
Bread x4 = Rs.160.00
Rice x3 = Rs.240.00
Biscuits x10 = Rs.300.00
Juice x5 = Rs.300.00
Subtotal: Rs.1000.00
GST (16%): Rs.160.00
Total Payable: Rs.1160.00



