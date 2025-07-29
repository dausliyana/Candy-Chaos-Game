document.addEventListener("DOMContentLoaded", function () {
    let progressBar = document.querySelector(".progress");

    // Reset width to 0% before animating
    progressBar.style.width = "0%";

    // Force reflow to apply the initial state before animation
    setTimeout(() => {
        progressBar.style.transition = "width 3s linear";
        progressBar.style.width = "100%";
    }, 50); // Small delay to ensure animation starts

    // Wait for animation to finish before redirecting
    setTimeout(function () {
        window.location.href = "level.html"; // Make sure this file exists!
    }, 3050); // Slightly longer to match animation time
});