<?php
// check_messages.php
// Run this from command line: php check_messages.php

// Database Configuration
$host = "localhost";
$db_name = "portfolio_db";
$username = "root";
$password = ""; // Default XAMPP password is empty

// Connect to MySQL
$conn = new mysqli($host, $username, $password, $db_name);

// Check Connection
if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error . "\n");
}

echo "✅ Connected to database successfully!\n\n";
echo "========================================\n";
echo "       CONTACT FORM MESSAGES\n";
echo "========================================\n\n";

// Fetch all messages
$sql = "SELECT * FROM contacts ORDER BY created_at DESC";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $count = 1;
    while($row = $result->fetch_assoc()) {
        echo "📧 Message #" . $count . "\n";
        echo "─────────────────────────────────────\n";
        echo "ID:       " . $row["id"] . "\n";
        echo "Name:     " . $row["name"] . "\n";
        echo "Email:    " . $row["email"] . "\n";
        echo "Message:  " . $row["message"] . "\n";
        echo "Date:     " . $row["created_at"] . "\n";
        echo "─────────────────────────────────────\n\n";
        $count++;
    }
    echo "Total Messages: " . $result->num_rows . "\n";
} else {
    echo "📭 No messages found in the database.\n";
}

$conn->close();
?>
