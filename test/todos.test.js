const { ObjectId } = require("mongodb")
const request = require("supertest")
const app = require("../src/app")
const { connectToDB, closeConnection, getDB } = require("../src/database")

const baseUrl = "/todos"

beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
    const MONGODB_DB = process.env.MONGODB_DB || 'mytodos-test'

    await connectToDB(MONGODB_URI, MONGODB_DB)
})

afterEach(async () => {
    const db = getDB()
    await db.dropCollection("todos")
})

beforeEach(async () => {
    const db = getDB()
    await db.createCollection("todos")
})

afterAll(async () => {
    closeConnection()
})

describe("GET /todos", () => {
    test("should respond with a 200 status code", async () => {
        const response = await request(app.callback()).get(baseUrl)
        expect(response.statusCode).toBe(200)
    })

    test("should respond with JSON", async () => {
        const response = await request(app.callback()).get(baseUrl)
        expect(response.type).toBe("application/json")
    })

    test("should respond with list of existing todos", async () => {
        getDB().collection("todos").insertMany([{
            title: "Todo de test 1",
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date()
        },{
            title: "Todo de test 2",
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }])
        const response = await request(app.callback()).get(baseUrl)
        console.log(response.body)
        expect(response.body[0].title).toBe("Todo de test 1")
        expect(response.body[1].title).toBe("Todo de test 2")
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBe(2)
    })
})
