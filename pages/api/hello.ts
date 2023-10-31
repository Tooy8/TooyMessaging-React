// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
//API 路由处理程序

//请求对象和响应对象。
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ name: "John Doe" });
}
