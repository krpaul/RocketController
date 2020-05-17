class Flight < ApplicationRecord
    has_many :telemetries
    has_many :images
end
