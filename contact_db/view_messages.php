<?php
// view_messages.php

$host = "localhost";
$db_name = "portfolio_db";
$username = "root";
$password = "";

// Connect to MySQL (without selecting database first)
$conn = new mysqli($host, $username, $password);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if not exists
$sql_create_db = "CREATE DATABASE IF NOT EXISTS $db_name";
$conn->query($sql_create_db);

// Now select the database
$conn->select_db($db_name);

// Create table if not exists
$sql_create_table = "CREATE TABLE IF NOT EXISTS contacts (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($sql_create_table);

$sql = "SELECT * FROM contacts ORDER BY created_at DESC";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Messages</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: #050505; 
            color: #e0e0e0; 
            padding: 40px; 
        }
        h1 { color: #00f2ff; border-bottom: 2px solid #333; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
        th, td { border: 1px solid #333; padding: 15px; text-align: left; }
        th { background: #111; color: #00f2ff; text-transform: uppercase; letter-spacing: 1px; font-size: 0.9rem; }
        tr:nth-child(even) { background: #111; }
        tr:hover { background: #1a1a1a; }
        .no-msg { text-align: center; color: #777; font-style: italic; }
    </style>
</head>
<body>
    <h1>📥 Received Messages</h1>
    <table>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Date & Time</th>
        </tr>
        <?php
        if ($result && $result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                echo "<tr>
                        <td>" . $row["id"] . "</td>
                        <td>" . htmlspecialchars($row["name"]) . "</td>
                        <td>" . htmlspecialchars($row["email"]) . "</td>
                        <td>" . htmlspecialchars($row["message"]) . "</td>
                        <td>" . $row["created_at"] . "</td>
                      </tr>";
            }
        } else {
            echo "<tr><td colspan='5' class='no-msg'>No messages found yet. Test your form!</td></tr>";
        }
        $conn->close();
        ?>
    </table>
</body>
</html>
