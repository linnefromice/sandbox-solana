use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("8yYTuH1jM6dJhUt2UrYkiiAn5XpZ7op9x2oZD3zXSBGm");

#[program]
pub mod program_spl {
    use super::*;

    pub fn hello(_ctx: Context<Hello>) -> Result<String> {
        let msg = "Hello,world!".to_string();
        msg!(&msg);
        Ok(msg)
    }

    pub fn transfer_to_user(ctx: Context<TransferSplToUser>, amount: u64) -> Result<()> {
        let dst = &ctx.accounts.to_ata;
        let src = &ctx.accounts.from_ata;
        let token_program = &ctx.accounts.token_program;
        let authority = &ctx.accounts.from;
        let cpi_accounts = token::Transfer {
            from: src.to_account_info().clone(),
            to: dst.to_account_info().clone(),
            authority: authority.to_account_info().clone(),
        };
        let cpi_program = token_program.to_account_info();

        token::transfer(CpiContext::new(cpi_program, cpi_accounts), amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Hello {}

#[derive(Accounts)]
pub struct TransferSplToUser<'info> {
    pub from: Signer<'info>,
    #[account(mut)]
    pub from_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}
