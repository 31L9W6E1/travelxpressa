import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Feedback = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success("Санал хүсэлт амжилттай илгээгдлээ.");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="py-10 border-b border-dashed border-border/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-bold">Санал хүсэлт</h1>
          <p className="text-muted-foreground mt-2">
            Үйлчилгээний чанар, сайт ашиглалтын туршлага, сайжруулах саналуудаа бидэнд илгээнэ үү.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Санал хүсэлт илгээх</CardTitle>
              <CardDescription>Доорх маягтыг бөглөж илгээнэ үү.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback-name">Нэр</Label>
                  <Input
                    id="feedback-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Нэрээ оруулна уу"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback-email">Имэйл</Label>
                  <Input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Имэйл хаяг"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback-message">Санал, сэтгэгдэл</Label>
                  <Textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Энд бичнэ үү..."
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  Илгээх
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Шуурхай холбоо</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>0000000</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>support@visamn.com</span>
              </div>
              <Link to="/contactsupport" className="inline-flex items-center gap-2 text-primary hover:underline">
                <MessageSquare className="w-4 h-4" />
                Шууд чат руу орох
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Feedback;
