import type { NextApiRequest, NextApiResponse } from "next";

const bufferToBase64 = (buffer: ArrayBuffer) => {
  const arr = new Uint8Array(buffer);
  const base64 = btoa(
    arr.reduce((data, byte) => data + String.fromCharCode(byte), "")
  );
  return `data:image/png;base64,${base64}`;
};

const generateAction = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("Received request");
  interface MyRequestBody {
    prompt: string;
  }
  interface _503Error{
    "error":string,
    "estimated_time":number
  }

  const body = JSON.parse(req.body as string) as MyRequestBody;
  const prompt = body.prompt

  console.log(prompt);
  if (process.env.HF_AUTH_KEY) {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/moinbukhari/sd-15-2-moin`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_AUTH_KEY}`,
          "Content-Type": "application/json",
          "x-use-cache": "false",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
        }),
      }
    );

    if (response.ok) {
      const buffer = await response.arrayBuffer();
      // Convert to base64
      const base64 = bufferToBase64(buffer);
      // Make sure to change to base64
      res.status(200).json({ image: base64 });
    } else if (response.status === 503) {
      const json = await response.json() as _503Error;
      res.status(503).json(json);
    } else {
      await response.json() as unknown;
      res.status(response.status).json({ error: response.statusText });
    }
  }

  else{
    throw new Error("no API KEY");
  }
};

export default generateAction;
