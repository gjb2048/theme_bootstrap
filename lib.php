<?php
// This file is part of The Bootstrap 3 Moodle theme
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.


/**
 * Renderers to align Moodle's HTML with that expected by Bootstrap
 *
 * @package    theme_bootstrap
 * @copyright  2014 Bas Brands, www.basbrands.nl
 * @authors    Bas Brands, David Scotson
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();


function bootstrap_grid($hassidepre, $hassidepost) {

    if ($hassidepre && $hassidepost) {
        $regions = array('content' => 'col-sm-6 col-sm-push-3 col-lg-8 col-lg-push-2');
        $regions['pre'] = 'col-sm-3 col-sm-pull-6 col-lg-2 col-lg-pull-8';
        $regions['post'] = 'col-sm-3 col-lg-2';
    } else if ($hassidepre && !$hassidepost) {
        $regions = array('content' => 'col-sm-9 col-sm-push-3 col-lg-10 col-lg-push-2');
        $regions['pre'] = 'col-sm-3 col-sm-pull-9 col-lg-2 col-lg-pull-10';
        $regions['post'] = 'emtpy';
    } else if (!$hassidepre && $hassidepost) {
        $regions = array('content' => 'col-sm-9 col-lg-10');
        $regions['pre'] = 'empty';
        $regions['post'] = 'col-sm-3 col-lg-2';
    } else if (!$hassidepre && !$hassidepost) {
        $regions = array('content' => 'col-md-12');
        $regions['pre'] = 'empty';
        $regions['post'] = 'empty';
    }

    return $regions;
}

/**
 * Loads the JavaScript for the zoom function.
 *
 * @param moodle_page $page Pass in $PAGE.
 */
function theme_bootstrap_initialise_zoom(moodle_page $page) {
    user_preference_allow_ajax_update('theme_bootstrap_zoom', PARAM_TEXT);
    $page->requires->yui_module('moodle-theme_bootstrap-zoom', 'M.theme_bootstrap.zoom.init', array());
}

/**
 * Get the user preference for the zoom function.
 */
function theme_bootstrap_get_zoom() {
    return get_user_preferences('theme_bootstrap_zoom', '');
}

// Moodle CSS file serving.
function theme_bootstrap_get_csswww() {
    global $CFG;

    if (right_to_left()) {
        $moodlecss = 'moodle-rtl.css';
    } else {
        $moodlecss = 'moodle.css';
    }

    $syscontext = context_system::instance();
    $itemid = theme_get_revision();
    $url = moodle_url::make_file_url("$CFG->wwwroot/pluginfile.php", "/$syscontext->id/theme_bootstrap/style/$itemid/$moodlecss");
    // Now this is tricky because the we can not hard code http or https here, lets use the relative link.
    // Note: unfortunately moodle_url does not support //urls yet.
    $url = preg_replace('|^https?://|i', '//', $url->out(false));

    return $url;
}

function theme_bootstrap_pluginfile($course, $cm, $context, $filearea, $args, $forcedownload, array $options = array()) {
    if ($context->contextlevel == CONTEXT_SYSTEM) {
        if ($filearea === 'style') {
            global $CFG;
            if (!empty($CFG->themedir)) {
                $thestylepath = $CFG->themedir . '/bootstrap/style/';
            } else {
                $thestylepath = $CFG->dirroot . '/theme/bootstrap/style/';
            }
            send_file($thestylepath.$args[1], $args[1], 20 , 0, false, false, 'text/css');
        } else {
            send_file_not_found();
        }
    } else {
        send_file_not_found();
    }
}