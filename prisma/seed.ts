import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedProduct() {
    await prisma.product.createMany({
        data: [
            {
                name: "Notebook",
                description: "14 inch, Intel i5",
                price: 23900,
            },
            {
                name: "Wireless Mouse",
                description: "Ergonomic design",
                price: 590,
            },
        ],
    });
}
async function main() {
    await seedProduct();
    console.log(" Seeded data successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    })