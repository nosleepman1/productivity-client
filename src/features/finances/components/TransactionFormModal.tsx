import { useState, type FormEvent } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import {
  FORM_INPUT_CLASS,
  FORM_SELECT_CLASS,
  FormActions,
  FormField,
  FormSheet,
} from "@/components/ui/FormSheet";
import { useActiveEspace } from "@/features/espaces/hooks/useEspaces";
import {
  CATEGORIES_DEPENSES,
  CATEGORIES_REVENUS,
  MOYENS_PAIEMENT,
} from "@/features/finances/hooks/useFinancesResume";
import {
  toTransactionDto,
  transactionFormSchema,
} from "@/features/finances/schemas/transaction.schema";
import { toDateInputValue } from "@/features/finances/utils/format";
import { useProjets } from "@/features/productivity/hooks/useProjets";
import { cn } from "@/lib/utils";
import type {
  CreateDepenseDto,
  CreateRevenuDto,
  Depense,
  Revenu,
} from "@/types/finances";

/** Propriétés de la modale d'ajout ou édition d'un revenu ou d'une dépense. */
export interface TransactionFormModalProps {
  /** Contrôle l'affichage de la modale. */
  open: boolean;
  /** Type de transaction ciblé. */
  kind: "revenu" | "depense";
  /** Élément existant en mode édition, ou `null` en création. */
  initialData: Revenu | Depense | null;
  /** Indique si la mutation est en cours. */
  isPending: boolean;
  /** Ferme la modale. */
  onClose: () => void;
  /** Soumet le DTO validé par Zod. */
  onSubmit: (dto: CreateRevenuDto & CreateDepenseDto) => void;
}

interface InnerFormProps {
  kind: "revenu" | "depense";
  initialData: Revenu | Depense | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateRevenuDto & CreateDepenseDto) => void;
}

function TransactionInnerForm({
  kind,
  initialData,
  isPending,
  onClose,
  onSubmit,
}: InnerFormProps) {
  const isRevenu = kind === "revenu";
  const isEditing = Boolean(initialData);
  const { activeEspaceId } = useActiveEspace();
  const projetsQuery = useProjets(activeEspaceId, { page: 1, limit: 50 });
  const projets = projetsQuery.data?.data ?? [];

  const [montant, setMontant] = useState(
    initialData ? String(initialData.montant) : "",
  );
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [date, setDate] = useState(
    initialData
      ? toDateInputValue(initialData.date)
      : toDateInputValue(new Date().toISOString()),
  );
  const [categorie, setCategorie] = useState(
    initialData?.categorie ?? (isRevenu ? "SALAIRE" : "ALIMENTATION"),
  );
  const [moyenPaiement, setMoyenPaiement] = useState(
    initialData?.moyenPaiement ?? "WAVE",
  );
  const [projetId, setProjetId] = useState(initialData?.projetId ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = isRevenu ? CATEGORIES_REVENUS : CATEGORIES_DEPENSES;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedNumber = Number(montant);
    const result = transactionFormSchema.safeParse({
      montant: montant.trim() === "" ? NaN : parsedNumber,
      description,
      date,
      categorie,
      moyenPaiement,
      projetId: projetId || null,
    });

    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit(toTransactionDto(result.data));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        htmlFor="tx-montant"
        label="Montant"
        hint="FCFA"
        required
        error={errors.montant}
      >
        <div className="relative">
          <input
            id="tx-montant"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            placeholder="25 000"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className={cn(
              FORM_INPUT_CLASS,
              "pr-16 text-lg font-bold tabular-nums",
            )}
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-bold tracking-wider text-[var(--muted-foreground)]">
            FCFA
          </span>
        </div>
      </FormField>

      <FormField
        htmlFor="tx-description"
        label="Description"
        required
        error={errors.description}
      >
        <input
          id="tx-description"
          type="text"
          maxLength={255}
          placeholder={
            isRevenu
              ? "Ex : Facture client, salaire, vente..."
              : "Ex : Loyer, internet, matériel..."
          }
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={FORM_INPUT_CLASS}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField htmlFor="tx-categorie" label="Catégorie">
          <select
            id="tx-categorie"
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className={FORM_SELECT_CLASS}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField htmlFor="tx-moyen" label="Moyen de paiement">
          <select
            id="tx-moyen"
            value={moyenPaiement}
            onChange={(e) => setMoyenPaiement(e.target.value)}
            className={FORM_SELECT_CLASS}
          >
            {MOYENS_PAIEMENT.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField
          htmlFor="tx-date"
          label="Date de l'opération"
          required
          error={errors.date}
        >
          <input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={cn(FORM_INPUT_CLASS, "tabular-nums")}
          />
        </FormField>

        <FormField htmlFor="tx-projet" label="Projet lié" hint="Optionnel">
          <select
            id="tx-projet"
            value={projetId}
            onChange={(e) => setProjetId(e.target.value)}
            className={FORM_SELECT_CLASS}
          >
            <option value="">Aucun projet</option>
            {projets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titre}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormActions
        submitLabel={isEditing ? "Enregistrer" : "Ajouter"}
        isPending={isPending}
        accent={isRevenu ? "emerald" : "rose"}
        onCancel={onClose}
      />
    </form>
  );
}

/**
 * Modale mobile-first pour créer ou modifier un revenu ou une dépense avec validation Zod.
 */
export function TransactionFormModal({
  open,
  kind,
  initialData,
  isPending,
  onClose,
  onSubmit,
}: TransactionFormModalProps) {
  const isRevenu = kind === "revenu";
  const isEditing = Boolean(initialData);

  const title = isEditing
    ? isRevenu
      ? "Modifier le revenu"
      : "Modifier la dépense"
    : isRevenu
      ? "Nouveau revenu"
      : "Nouvelle dépense";

  return (
    <FormSheet
      open={open}
      titleId="tx-modal-title"
      title={title}
      subtitle={
        isRevenu
          ? "Enregistrez une entrée d'argent dans votre espace"
          : "Suivez une sortie d'argent dans votre espace"
      }
      icon={
        isRevenu ? (
          <ArrowDownLeft className="h-5 w-5" />
        ) : (
          <ArrowUpRight className="h-5 w-5" />
        )
      }
      accent={isRevenu ? "emerald" : "rose"}
      isPending={isPending}
      onClose={onClose}
    >
      <TransactionInnerForm
        key={initialData?.id ?? `new-${kind}`}
        kind={kind}
        initialData={initialData}
        isPending={isPending}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </FormSheet>
  );
}
