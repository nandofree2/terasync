admin_role = Role.find_or_create_by!(name: 'admin')
user_role = Role.find_or_create_by!(name: 'user')

admin = User.find_or_initialize_by(email: 'admin@gmail.com', name: 'admin_root')
admin.role_id = admin_role.id
admin.password = '12341234'
admin.password_confirmation = admin.password
admin.save!
puts "Admin: #{admin.email, admin.name}"
