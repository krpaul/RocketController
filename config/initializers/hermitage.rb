require 'mini_magick'

METADATA = "data:image/jpeg;base64,"
Hermitage.configure :images do
    original -> img { 
        img.base64
    }

    thumbnail -> img { 
        img.base64_thumbnail
    }
end