import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mongoose, { Schema, model } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import APIFeatures from "../../src/utils/apiFeatures";

interface ITestDoc {
  name: string;
  age: number;
}

const TestSchema = new Schema<ITestDoc>({
  name: String,
  age: Number,
});

const TestModel = model<ITestDoc>("Test", TestSchema);

describe("APIFeatures", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Seed data
    await TestModel.create([
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
      { name: "Charlie", age: 35 },
    ]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("filters results based on query parameters", async () => {
    const query = TestModel.find();
    const queryString = { age: { gte: "30" } };

    const features = new APIFeatures(query, queryString).filter();
    const results = await features.query.exec();

    expect(results.length).toBe(2);
    expect(results.map((doc) => doc.name)).toContain("Alice");
    expect(results.map((doc) => doc.name)).toContain("Charlie");
  });

  it("sorts results based on query parameters", async () => {
    const query = TestModel.find();
    const queryString = { sort: "age" };

    const features = new APIFeatures(query, queryString).sort();
    const results = await features.query.exec();

    expect(results.map((doc) => doc.age)).toEqual([25, 30, 35]);
  });

  it("limits fields based on query parameters", async () => {
    const query = TestModel.find();
    const queryString = { fields: "name" };

    const features = new APIFeatures(query, queryString).limitFields();
    const results = await features.query.exec();

    const resultObj = results[0].toObject();

    expect(resultObj).toHaveProperty("name");
    expect(resultObj).not.toHaveProperty("age");
  });

  it("paginates results based on query parameters", async () => {
    const query = TestModel.find();
    const queryString = { page: "2", limit: "1" };

    const features = new APIFeatures(query, queryString).paginate();
    const results = await features.query.exec();

    expect(results.length).toBe(1);
    expect(results[0].name).toBe("Bob");
  });
});
