import User from '../models/User.js';

// @desc    Get all users (Super Admin only)
// @route   GET /api/users
// @access  Private (Super Admin)
export const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user directly (Super Admin only)
// @route   POST /api/users
// @access  Private (Super Admin)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, studentId, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'password123',
      role: role || 'student',
      phone,
      studentId,
      department,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or status (Super Admin only)
// @route   PUT /api/users/:id
// @access  Private (Super Admin)
export const updateUser = async (req, res, next) => {
  try {
    const { role, isActive, department, phone } = req.body;
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (department) user.department = department;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Super Admin)
export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
