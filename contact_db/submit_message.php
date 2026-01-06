<?php
// submit_message.php

// CORS Headers (in case you are running front-end and back-end on different ports, though usually not needed for same-origin)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle POST request
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    
    // Get JSON input
    $json = file_get_contents("php://input");
    $data = json_decode($json);

    // Validate input
    if (
        !isset($data->name) || 
        !isset($data->email) || 
        !isset($data->message) ||
        empty($data->name) ||
        empty($data->email) ||
        empty($data->message)
    ) {
        http_response_code(400); // Bad Request
        echo json_encode(["error" => "Incomplete data. Please provide name, email, and message."]);
        exit;
    }

    // Database Configuration
    $host = "localhost";
    $db_name = "portfolio_db";
    $username = "root";
    $password = ""; // Default XAMPP password is empty

    // Connect to MySQL
    $conn = new mysqli($host, $username, $password);

    // Check Connection
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
        exit;
    }

    // Create Database if not exists
    $sql_create_db = "CREATE DATABASE IF NOT EXISTS $db_name";
    if ($conn->query($sql_create_db) === TRUE) {
        $conn->select_db($db_name);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error creating database: " . $conn->error]);
        $conn->close();
        exit;
    }

    // Create Table if not exists
    $sql_create_table = "CREATE TABLE IF NOT EXISTS contacts (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    if ($conn->query($sql_create_table) !== TRUE) {
        http_response_code(500);
        echo json_encode(["error" => "Error creating table: " . $conn->error]);
        $conn->close();
        exit;
    }

    // Prepare and Bind
    $stmt = $conn->prepare("INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $data->name, $data->email, $data->message);

    // Execute
    if ($stmt->execute()) {
        http_response_code(201); // Created
        echo json_encode(["message" => "Message sent successfully!"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error saving message: " . $stmt->error]);
    }

    // Close connections
    $stmt->close();
    $conn->close();

} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "Method not allowed. Use POST."]);
}
?>
