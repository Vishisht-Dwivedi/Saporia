import {prisma} from "../lib/prisma"

async function testConn() {
    try {
        await prisma.user.count();
    } catch (error) {
        console.log(error);
    }
}
testConn();