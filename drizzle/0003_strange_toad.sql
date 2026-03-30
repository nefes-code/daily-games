CREATE TABLE "ResultReaction" (
	"id" text PRIMARY KEY NOT NULL,
	"emoji" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"resultId" text NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "ResultReaction_resultId_userId_unique" UNIQUE("resultId","userId")
);
--> statement-breakpoint
ALTER TABLE "ResultReaction" ADD CONSTRAINT "ResultReaction_resultId_GameResult_id_fk" FOREIGN KEY ("resultId") REFERENCES "public"."GameResult"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ResultReaction" ADD CONSTRAINT "ResultReaction_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;