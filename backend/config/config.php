<?php
    $server = "localhost";
    $user = "root";
    $password = "";
    $db_name = "text_mate";


    
    //connect to db
    try{
        $connect = mysqli_connect($server, $user, $password, $db_name);
    }catch(mysqli_sql_exception) {
        header('location: ../../renderer/error.html'); 
        exit(); 
    }
