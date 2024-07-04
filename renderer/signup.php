<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notes Mate</title>
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline';" />
    <link rel="icon" href="assets/logo.png">
    <!--font awesome-->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!--CUSTOM CSS-->
    <link rel="stylesheet" href="css/main.css">
</head>

<body>
    <?php
         if (isset($_GET['error'])) {
            // Decode the message
            $msg = urldecode($_GET['error']);
            echo '<span class="genric-btn danger error-cont" style="margin-left: 10px; margin-top: 10px;">' . htmlspecialchars($msg) . '</span>';

            unset($_GET['error']);
    
        }

       //Success
       if (isset($_GET['success'])) {
        // Decode the message
        $msg = urldecode($_GET['success']);

        echo '<span class="genric-btn success error-cont success-toast" style="position: absolute; top: 10px; left: 10px; z-index: 20; background-color: rgb(76, 211, 227); margin-left: 10px; margin-top: 10px;">' . htmlspecialchars($msg) . '</span>';

        unset($_GET['error']);

    }

        
    ?>
    
    <div class="first-section">
        <div class="title-head">
            SignUp
        </div>
        <!--go back cont-->
        <div class="go-back-cont-main">
            <div class="go-back-cont">
                <a href="index.html">
                    <i class="fa-solid fa-arrow-left"></i>
                </a>
            </div>
        </div>
        <!--go back cont-->
    </div>

    <div class="second-section">
        <form action="../backend/register.php" method="post">
            <div><h6 style="pointer-events: none; margin-bottom: 3px; margin-top: 6px;">Username</h6></div>
            <div class="task-title-input">
                <input type="text" placeholder="Username" name="username">
            </div>
            <div><h6 style="pointer-events: none; margin-bottom: 3px; margin-top: 6px;">Email</h6></div>
            <div class="task-title-input">
                <input type="text" placeholder="Email" name="email">
            </div>
            <div><h6 style="pointer-events: none; margin-bottom: 3px; margin-top: 6px;">Password</h6></div>
            <div class="task-title-input">
                <input type="password" placeholder="Password" name="password">
            </div>
            <div>
                <button type="submit" class="add-btn" name="signubtn">SignUp</button>
                <div style="display: flex; align-items: center; gap: 3px;">
                    <h6 style="pointer-events: none; margin-bottom: 3px; margin-top: 6px;">Not a new member?</h6>
                    <a href="login.html"  style="color: #9FEF00; cursor: pointer; font-size: 12px;">Login</a>
                </div>
                
            </div>
        </form>
    </div>
    
    
</body>

</html>
