require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const contentRoutes = require('./routes/content');
const postRoutes = require('./routes/post');
const productRoutes = require('./routes/product');
const eventRoutes = require('./routes/event');
const enrollRoutes = require('./routes/enroll');
const certificateRoutes = require('./routes/certificate');
const certEnrollRoutes = require('./routes/certEnroll');
const feedbackRoutes = require('./routes/feedback');
const commentRoutes = require('./routes/comment');
const orderRoutes = require('./routes/order');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 挂载路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/products', productRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/enroll', enrollRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/certEnroll', certEnrollRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', commentRoutes);

app.get('/', (req, res) => {
  res.send("Tea Culture API Running")
});

app.listen(PORT, () => {
  console.log(`服务运行在 http://localhost:${PORT}`);
});
