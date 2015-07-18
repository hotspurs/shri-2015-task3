sass_extensions = File.join(File.dirname(__FILE__), '/.sass-extensions/')
add_import_path File.join(sass_extensions, 'stylesheets')

require File.join(sass_extensions, 'libs/retina.rb')
require File.join(sass_extensions, 'libs/rgbapng.rb')
# Set this to the root of your project when deployed:

http_path = "/"
project_path = File.expand_path(File.join(File.dirname(__FILE__), '.'))
css_dir = "src/stylesheets"
sass_dir = "src/_sass"
images_dir = "src/images"
javascripts_dir = "src/javascripts"
http_javascripts_dir = "/public"
http_stylesheets_dir = "/public"
http_images_dir = "/public/images"


# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed
#output_style = :compressed
# To enable relative paths to assets via compass helper functions. Uncomment:
relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
