import mongoose from "mongoose";

const redactUri = (uri) => {
    if (!uri) return "";
    try {
        const u = new URL(uri);
        if (u.username) {
            u.username = "***";
        }
        if (u.password) {
            u.password = "***";
        }
        return u.toString();
    } catch {
        return uri;
    }
};

const connectDB = async () => {
    const uri =
        process.env.MONGODB_URI ||
        process.env.MONGODB_LOCAL_URI ||
        "mongodb+srv://irabaruta:01402@mydb.qhgx1yd.mongodb.net/E-ivuze?appName=mydb";

    mongoose.connection.on("connected", () => {
        console.log("✅ MongoDB connection established");
    });
    mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err?.message || err);
    });

    try {
        console.log("⏳ Connecting to MongoDB:", redactUri(uri));
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
        });
    } catch (error) {
        const msg = error?.message || String(error);
        console.error("❌ Failed to connect to MongoDB.");
        if (uri.startsWith("mongodb+srv://")) {
            console.error("   If you see ESERVFAIL on an SRV host (mongodb+srv), your DNS may block SRV lookups.");
            console.error("   Try setting MONGODB_URI to a non-SRV connection string (mongodb:// with host:port) from Atlas → Connect → Drivers.");
        }
        console.error("   Erseedror:", msg);
        console.error("   Error:", msg);
        throw error;
    }
};

export default connectDB;