<?php
/**
 * Plugin Name: LifeITUp 2-Minute Holistic Wellbeing Assessment
 * Plugin URI:  https://lifeitupworldwide.com
 * Description: Official LifeITUp 2-Minute Wellbeing Assessment tool with automatic Mailchimp, Google Sheets, WhatsApp, and Gmail SMTP integration.
 * Version:     1.0.0
 * Author:      LifeITUp WorldWide
 * Author URI:  https://lifeitupworldwide.com
 * License:     GPL-2.0+
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register Shortcode [lifeitup_assessment]
 */
function lifeitup_assessment_shortcode($atts) {
    $a = shortcode_atts(array(
        'url'    => 'https://lifeitup.vercel.app',
        'height' => '950px',
        'width'  => '100%',
        'border' => 'none'
    ), $atts);

    $url    = esc_url($a['url']);
    $height = esc_attr($a['height']);
    $width  = esc_attr($a['width']);

    ob_start();
    ?>
    <div class="lifeitup-assessment-wrapper" style="width: 100%; max-width: 100%; margin: 0 auto; position: relative; overflow: hidden; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        <iframe 
            id="lifeitup-frame"
            src="<?php echo $url; ?>" 
            width="<?php echo $width; ?>" 
            height="<?php echo $height; ?>" 
            style="width: 100%; min-height: <?php echo $height; ?>; border: none; display: block;" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            loading="lazy">
        </iframe>
    </div>
    <script>
        (function() {
            // Optional: Adjust height dynamically on mobile
            function adjustHeight() {
                var frame = document.getElementById('lifeitup-frame');
                if (frame) {
                    if (window.innerWidth < 768) {
                        frame.style.minHeight = '1100px';
                    } else {
                        frame.style.minHeight = '950px';
                    }
                }
            }
            window.addEventListener('resize', adjustHeight);
            adjustHeight();
        })();
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('lifeitup_assessment', 'lifeitup_assessment_shortcode');
