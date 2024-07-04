<?php
    include('../backend/config/config.php');

    if(isset($_POST['signubtn'])) {
        $username = $_POST['username'];
        $email = $_POST['email'];
        $password = $_POST['password'];

        $hashed_pass = password_hash($password, PASSWORD_DEFAULT);

        if(empty($username) || empty($email) || empty($password)) {
            $error_message = "All fields required";
            $error_message_encoded = urlencode($error_message);
            header("location: ../signup.html?error=$error_message_encoded");
            exit();
        }
    }