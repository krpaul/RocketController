require 'mini_magick'

METADATA = "data:image/jpeg;base64,"
Hermitage.configure :images do
    original -> img { 
        img.base64
    }

    thumbnail -> img { 
        img_obj = MiniMagick::Image.read(Base64.decode64(img.base64[METADATA.size..-1]))
        img_obj.resize "200x150"
        return METADATA + Base64.encode64(img_obj.to_blob).to_s
    }
end