<?php
/**
 * Template Name: LifeITUp Wellbeing Assessment
 * Description: Dedicated Full-Width WordPress Theme Template for LifeITUp 2-Minute Wellbeing Assessment.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Is file ko apne WordPress theme folder me upload karein:
 *    wp-content/themes/<your-active-theme>/page-wellbeing-check.php
 * 2. WordPress Admin me jayein -> Pages -> Add New.
 * 3. Right sidebar me 'Page Attributes' -> 'Template' dropdown se select karein:
 *    "LifeITUp Wellbeing Assessment"
 * 4. Page publish kar dein!
 */

get_header();
?>

<main id="primary" class="site-main lifeitup-page-wrapper" style="background-color: #FAF6EE; min-height: 100vh; padding: 40px 16px;">
    <?php include plugin_dir_path(__FILE__) . 'LifeITUp-Standalone-Code.html'; ?>
</main>

<?php
get_footer();
