import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Panel } from "@/components/eltri/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addContact, fetchContacts } from "@/lib/api/crm.functions";
import { formatDate } from "@/lib/format";
import { useWorkspace } from "@/lib/workspace-context";

export const Route = createFileRoute("/_authenticated/contatos")({
  head: () => ({
    meta: [
      { title: "Contatos — ELTRI CRM" },
      { name: "description", content: "Base de contatos, leads e clientes da empresa." },
      { property: "og:title", content: "Contatos — ELTRI CRM" },
      { property: "og:description", content: "Base de contatos, leads e clientes da empresa." },
    ],
  }),
  component: ContactsPage,
});

const KIND_LABEL: Record<string, string> = {
  lead: "Lead",
  client: "Cliente",
  owner: "Proprietário",
  partner: "Parceiro",
};

function ContactsPage() {
  const { companyId } = useWorkspace();
  const queryClient = useQueryClient();
  const load = useServerFn(fetchContacts);
  const create = useServerFn(addContact);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    kind: "lead",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["contacts", companyId],
    queryFn: () => load({ data: { companyId } }),
  });

  const mutation = useMutation({
    mutationFn: () =>
      create({
        data: {
          companyId,
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          source: form.source || undefined,
          kind: form.kind as "lead" | "client" | "owner" | "partner",
        },
      }),
    onSuccess: () => {
      toast.success("Contato criado");
      setOpen(false);
      setForm({ name: "", email: "", phone: "", source: "", kind: "lead" });
      queryClient.invalidateQueries({ queryKey: ["contacts", companyId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", companyId] });
    },
    onError: (error: Error) => toast.error("Erro ao salvar", { description: error.message }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contatos"
        description="Leads, clientes, proprietários e parceiros da empresa."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Novo contato</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo contato</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={form.kind}
                      onValueChange={(value) => setForm({ ...form, kind: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(KIND_LABEL).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Origem</Label>
                    <Input
                      id="source"
                      value={form.source}
                      onChange={(e) => setForm({ ...form, source: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending || !form.name.trim()}
                >
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Panel>
        {isLoading ? (
          <EmptyState message="Carregando contatos…" />
        ) : (data?.length ?? 0) === 0 ? (
          <EmptyState message="Nenhum contato cadastrado." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">Contato</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Origem</TableHead>
                <TableHead className="hidden md:table-cell">Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {contact.email ?? contact.phone ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{KIND_LABEL[contact.kind] ?? contact.kind}</Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {contact.source ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {formatDate(contact.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </div>
  );
}
