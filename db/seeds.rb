# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
#

# Create a default flight
if Flight.all.length == 0
    f = Flight.new
    f.name = "Default Flight"
    f.desc = "A default flight for when no other flights exist"
    f.save!
end
